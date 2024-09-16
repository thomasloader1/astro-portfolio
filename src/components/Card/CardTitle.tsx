import React, { type FC } from 'react'
import type { Company } from '../../types/Experience';

interface Props{
    title: string;
    date: string;
    company: Company;
    isCurrent: boolean;
}

const CardTitle: FC<Props> = ({title, date, company,isCurrent}) => {
  return (
    <div className={`${!isCurrent && "mb-4"}`}>
        <h2 className={`text-2xl font-bold ${isCurrent ? "text-white" : "text-grey-primary"}`}>
            {title} 
            <div className="inline">
                <span className={`mx-2 ${isCurrent ? "text-grey-primary" : "text-orange-primary"}`}>@</span>
                <a className="hover:text-orange-primary" href={company.link}>{company.name}</a>
            </div>
        </h2>
        <h4 className={`font-normal text-2xl ${isCurrent ? "text-white" : "text-grey-primary"}`}>
            <span className={`font-bold mr-2 ${isCurrent ? "text-grey-primary" : "text-orange-primary"}`}>/</span>
            {date}
        </h4>
    </div>
  )
}

export default CardTitle