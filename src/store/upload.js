import { createStore, createEvent } from 'effector'

export const toUploadChanged = createEvent()
export const $toUpload = createStore([]).on(
  toUploadChanged,
  (_, payload) => payload
)

export const forwardFiles = ({ target: { files } }) => {
  const toUpload = []
  for (let index = 0; index < files.length; index++) {
    const element = files[index]
    toUpload.push(element)
  }

  toUploadChanged(toUpload)
}

export const excelChanged = createEvent()
export const $excel = createStore([]).on(excelChanged, (_, payload) => payload)

export const forwardExcelFile = ({ target: { files } }) => {
  const excel = []
  for (let index = 0; index < files.length; index++) {
    const element = files[index]
    excel.push(element)
  }

  excelChanged(excel.length === 1 ? excel[0] : null)
}

export const datChanged = createEvent()
export const $dat = createStore([]).on(datChanged, (_, payload) => payload)

export const forwardDatFile = ({ target: { files } }) => {
  const dat = []
  for (let index = 0; index < files.length; index++) {
    const element = files[index]
    dat.push(element)
  }

  datChanged(dat.length === 1 ? dat[0] : null)
}
