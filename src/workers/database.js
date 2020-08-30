//#region api
const API_ROOT = 'http://localhost:3000/api'

let TOKEN = null

const setToken = (value) => (TOKEN = value)

async function send(method, url, data, resKey) {
  const headers = {},
    opts = { method: method.toUpperCase(), headers }

  if (data !== undefined) {
    headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(data)
  }

  if (TOKEN) headers['Authorization'] = `Token ${TOKEN}`

  try {
    const response = await fetch(API_ROOT + url, opts)
    const json = await response.json()
    console.log(json)
    return resKey ? json[resKey] : json
  } catch (err) {
    return err
  }
}

const Documents = {
  get: (model, id, since) =>
    send('get', `/documents/${model}/${id}/${since || 'undefined'}`),
  patch: (model, item) => send('patch', `/document/${model}_doc`, item),
}

const Parents = {
  all: (since) => send('get', `/parents/${since || 'undefined'}`),
  post: (data) => send('post', `/parent`, data),
}

const Attributes = {
  all: (model, since) =>
    send('get', `/attributes/${model}/${since || 'undefined'}`),
}

const Data = {
  one: (model, data) => send('get', `/one/${model}`, data),
  post: (model, data) => send('post', `/one/${model}`, data),
  patch: (model, data) => send('patch', `/one/${model}`, data),
}

const Auth = {
  all: () => send('get', `/users`),
  get: (email, password) =>
    send('post', '/login', {
      email,
      password,
    }),
  post: (data) => send('post', '/register', data),
  patch: (data) => send('patch', '/user', data),
}

const Properties = {
  search: (since, search) => send('post', `/properties/${since}`, search),
  post: (data) => send('post', '/property', data),
}

//#endregion

// eslint-disable-next-line no-undef
import { expose } from 'comlink'
import loki from 'lokijs'
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter'

const attributes = [
  { name: 'unit', header: 'Unité' },
  { name: 'conservation', header: 'Conservation' },
  { name: 'assign', header: 'Affectation' },
  { name: 'nature', header: 'Consistance' },
  { name: 'owner', header: 'Propriétaire' },
  { name: 'doctype', header: 'Type de Document' },
]

let config = undefined

// eslint-disable-next-line no-undef
const db = new loki('habous', {
  // eslint-disable-next-line no-undef
  adapter: new loki.LokiPartitioningAdapter(new LokiIndexedAdapter(), {
    paging: true,
  }),
  autoload: true,
  autoloadCallback: () =>
    (config =
      db.getCollection('config') ||
      db.addCollection('config', { unique: ['id'] })),
  autosave: true,
  autosaveInterval: 10000,
})

const updateRecord = (collection, record, id = 'id') => {
  const query = {}
  query[id] = record[id]
  const existingRecord = collection.findOne(query)
  if (existingRecord) {
    const updatedRecord = existingRecord
    Object.keys(record).forEach(function (key) {
      updatedRecord[key] = record[key]
    })
    collection.update(updatedRecord)
  } else {
    collection.insert(record)
  }
}

const updateCollection = (collection, records) => {
  records.forEach(
    ((collection) => (record) => updateRecord(collection, record))(collection)
  )
}

const fetchAttribute = async (model) => {
  const time = config.findOne({ id: 'time' }) || { id: 'time' }
  const lastUpdated = time[model] || ''
  const res = await Attributes.all(model, lastUpdated)

  const collection =
    db.getCollection(model) || db.addCollection(model, { unique: ['id'] })

  if (!res?.forEach) return

  updateCollection(collection, res)

  const now = new Date().toISOString()
  time[model] = now
  updateRecord(config, time)
}

const fetchDocuments = async ({ model, id }) => {
  console.log(id)
  const time = config.findOne({ id: 'time' }) || { id: 'time' }
  const lastUpdated = time[model] || ''
  const res = await Documents.get(model + '_doc', id, lastUpdated)

  const collection =
    db.getCollection(model + '_doc') ||
    db.addCollection(model + '_doc', { unique: ['id'] })

  updateCollection(collection, res || [])

  const now = new Date().toISOString()
  time[model] = now
  updateRecord(config, time)

  let all =
    collection.chain().find({ ownerId: id }).simplesort('id').data() || []

  const documents = all
    .filter((e) => !e.deleted)
    .map((e) => ({
      id: e.id,
      name: e.name,
      size: e.size,
      type: e.docTypeId,
      src: e.thumbnail && 'data:image/png;base64,' + e.thumbnail,
      ownerId: e.ownerId,
      docTypeId: e.docTypeId,
    }))

  return documents
}

const fetchProperties = async (search = {}) => {
  if (!config) return null

  const time = config.findOne({ id: 'time' }) || { id: 'time' }
  const lastUpdated = time['property']
  const res = await Properties.search(lastUpdated, search)

  const collection =
    db.getCollection('property') ||
    db.addCollection('property', {
      unique: ['id'],
      indices: [
        'reference',
        'title',
        'ownerId',
        'natureId',
        'conservationId',
        'unitId',
        'address',
        'note',
      ],
    })

  if (res?.length) {
    updateCollection(collection, res)

    const now = new Date().toISOString()
    time['property'] = now

    updateRecord(config, time)
  }

  const q = {}

  if (search.label) {
    q.label = search.label
    let all = collection.chain().find(q).simplesort('unitId').data() || []
    return all.filter((e) => !e.deleted).reverse()
  }
  if (search.reference) q.reference = search.reference
  if (search.unitId) q.unitId = search.unitId
  if (search.conservationIds && search.conservationIds.length)
    q.conservationId = { $in: search.conservationIds.map((e) => e.id) }
  if (search.unitIds && search.unitIds.length)
    q.unitId = { $in: search.unitIds.map((e) => e.id) }
  if (search.assignIds && search.assignIds.length)
    q.assignId = { $in: search.assignIds.map((e) => e.id) }
  if (search.natureIds && search.natureIds.length)
    q.natureId = { $in: search.natureIds.map((e) => e.id) }
  if (search.ownerIds && search.ownerIds.length)
    q.ownerId = { $in: search.ownerIds.map((e) => e.id) }
  if (search.title) q.title = search.title
  if (search.areaMin) q.area = { $gte: search.areaMin }
  if (search.areaMax) q.area = { $lte: search.areaMax }
  if (search.locativeMin) q.locative = { $gte: search.locativeMin }
  if (search.locativeMax) q.locative = { $lte: search.locativeMax }
  if (search.venaleMin) q.venale = { $gte: search.venaleMin }
  if (search.venaleMax) q.venale = { $lte: search.venaleMax }
  if (search.regime) {
    const regimes = Object.keys(search.regime).filter((e) => search.regime[e])
    if (regimes && regimes.length) q.regime = { $in: regimes }
  }
  if (search.status) {
    const status = Object.keys(search.status).filter((e) => search.status[e])
    if (status && status.length) q.status = { $in: status }
  }

  let all = collection.chain().find(q).simplesort('unitId').data() || []

  if (search.address) {
    all = all.filter((e) => e.address.toLowerCase().includes(search.address))
  }
  if (search.note) {
    all = all.filter((e) => e.note.toUpperCase().includes(search.note))
  }

  return all.filter((e) => !e.deleted).reverse()
}

const fetchParents = async ({ data, isSearching, label }) => {
  if (!config) return null

  const time = config.findOne({ id: 'time' }) || { id: 'time' }
  const lastUpdated = time['parent']

  const res = await Parents.all(lastUpdated)

  const collection =
    db.getCollection('parent') ||
    db.addCollection('parent', {
      unique: ['id', 'label'],
    })

  if (res?.length) {
    updateCollection(collection, res)

    const now = new Date().toISOString()
    time['parent'] = now

    updateRecord(config, time)
  }

  let found

  if (!isSearching) found = collection.find({ deleted: false })
  else if (label) found = collection.find({ deleted: false, label })
  else {
    const ids = Object.keys(data).map((id) => parseInt(id))
    found = collection.find({ id: { $in: ids }, deleted: false })
  }

  return found.map((e) => {
    e.length = data['' + e.id] || 0
    return e
  })
}

const fetchAttributes = async () => {
  if (!config) return null

  let data = {}
  const promises = attributes.map((table) => fetchAttribute(table.name))
  return await Promise.all(promises).then(() => {
    attributes.map((table) => {
      data[table.name] = {
        header: table.header,
        items: db.getCollection(table.name).find({ deleted: false }).reverse(),
      }
    })
    return data
  })
}

const saveProperty = async (data) => {
  return await Properties.post(data)
}

const saveParent = async (data) => {
  return await Parents.post(data)
}

const editAttribute = async ({ model, data }) => {
  return await Data.patch(model, data)
}

const createAttribute = async ({ model, data }) => {
  return await Data.post(model, data)
}

const registerUser = async (data) => {
  return await Auth.post(data)
}

const updateUser = async (data) => {
  return await Auth.patch(data)
}

const fetchUsers = async () => {
  return await Auth.all()
}

const fetchUser = async ({ email, password }) => {
  const res = await Auth.get({
    email,
    password,
  })
  if (res.token) setToken(res.token)
  return res
}

const patchDocument = async ({ model, data }) => {
  return await Documents.patch(model, data)
}

function saveExcel(data) {
  const headers = [
    'Unité',
    'ID',
    'Statut de possession',
    'Régime',
    'Référence',
    'Conservation',
    'Affectation',
    'Consistance',
    'Propriétaire',
    'Superficie',
    'Valeur Vénale',
    'Valeur Locative',
    'X',
    'Y',
    'Adresse',
    'Note',
  ]
  const aoa = [
    headers,
    ...data.map((e) => {
      return [
        (db.getCollection('unit').findOne({ id: e.unitId }) || {}).text || '',
        e.title,
        e.status,
        e.regime,
        e.reference,
        (
          db.getCollection('conservation').findOne({ id: e.conservationId }) ||
          {}
        ).text || '',
        (db.getCollection('assign').findOne({ id: e.assignId }) || {}).text ||
          '',
        (db.getCollection('nature').findOne({ id: e.natureId }) || {}).text ||
          '',
        (db.getCollection('owner').findOne({ id: e.ownerId }) || {}).text || '',
        e.area.toFixed(4),
        e.venale.toFixed(2),
        e.locative.toFixed(2),
        Math.floor(e.projected[0]),
        Math.floor(e.projected[1]),
        e.address,
        e.note,
      ]
    }),
  ]
  return aoa
}

const getColorPaletteForAttributes = (attribute) => {
  if (!config || !attribute) return null
  const palette = ['match', ['get', 'parent_id']]
  const colors = {}
  const q = { deleted: false }
  db.getCollection('property')
    .find(q)
    .forEach((e) => {
      if (
        colors[e.label] &&
        colors[e.label] != colorArray[e[attribute + 'Id'] - 1] &&
        colors[e.label] != 'black'
      ) {
        colors[e.label] = 'white'
      } else colors[e.label] = colorArray[e[attribute + 'Id'] - 1] || 'black'
    })

  Object.keys(colors).forEach((e) => {
    palette.push(parseInt(e))
    palette.push(colors[e])
  })

  palette.push('#000000')
  return palette
}

const obj = {
  fetchAttributes,
  fetchProperties,
  fetchParents,
  fetchDocuments,
  editAttribute,
  createAttribute,
  saveProperty,
  saveParent,
  updateUser,
  registerUser,
  patchDocument,
  fetchUsers,
  fetchUser,
  saveExcel,
  getColorPaletteForAttributes,
}

expose(obj)

const colorArray = [
  '#ce521d',
  '#ca4b89',
  '#006b89',
  '#3e2d7e',
  '#61902c',
  '#faa31a',
  '#6e002a',
  '#4981b3',
  '#980069',
  '#2dacbf',
  '#ee1d25',
  '#9cb46f',
  '#9a869e',
  '#ee008c',
  '#00a895',
  '#7b181a',
  '#ffd63c',
  '#b46638',
  '#bcd634',
  '#f4ea00',
  '#32b6c0',
  '#e8ac1c',
  '#ea2d50',
  '#3c7022',
  '#0085cc',
  '#97C83B',
]
