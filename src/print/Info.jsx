import { h } from 'preact'

/** @jsx h */

import { useStore } from 'effector-react'
import { $propertyFormatted } from '../store/current'
import { $mapScale, $date } from '../store/print'

export default function PrintInfo() {
  const property = useStore($propertyFormatted)
  const scale = useStore($mapScale)
  const date = useStore($date)

  if (!property) return null

  return (
    <div className="p-4 h-full w-2/5">
      <table className="shadow-md">
        <tr>
          <th className="">ID</th>
          <th className="">{property[0].text}</th>
        </tr>
        {property
          .slice(1)
          .filter((e) => e.text.length || e.text > 0)
          .map((e) => (
            <tr key={e.id}>
              <td className="font-bold">{e.id}</td>
              <td className="">{e.text}</td>
            </tr>
          ))}
        <tr>
          <td className="font-bold">Echelle</td>
          <td className="">1/{scale}</td>
        </tr>
        <tr>
          <td className="font-bold">Date</td>
          <td className="">{date}</td>
        </tr>
      </table>
    </div>
  )
}
