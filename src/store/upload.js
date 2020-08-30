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
