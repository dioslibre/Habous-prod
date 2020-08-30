import { h } from 'preact'
import emblem from '../emblem.png'

/** @jsx h */

const Header = () => {
  return (
    <div className="mx-auto flex">
      <div className="flex-grow mr-4 my-auto text-center">
        <p>المملكة المغربية</p>
        <p>وزارة الأوقاف والشؤون الاسلامية</p>
        <p>نظارة أوقاف الدار البيضاء</p>
        <p>مصلحة الإستثمار و المحافظة على الأوقاف</p>
      </div>

      <div className="flex-grow my-1">
        <img
          className="w-32"
          src={emblem}
          alt="Royaume du Maroc"
          width="4rem"
          height="4rem"
        />
      </div>
    </div>
  )
}

export default Header
