import React, { type FC } from "react";
import type { Company } from "../../types/Experience";

interface Props {
  title: string;
  date: string;
  company: Company | null;
  isCurrent: boolean;
  onSubCard?: boolean;
}

const CardTitle: FC<Props> = ({
  title,
  date,
  company,
  isCurrent,
  onSubCard,
}) => {
  return (
    <div className={`${!isCurrent && "mb-4"} ml-2`}>
      <h2
        className={`text-2xl font-bold ${isCurrent ? "text-white" : "text-grey-primary"}`}
      >
        {title}
        <div className="inline">
          <span
            className={`mx-2 ${isCurrent ? "text-grey-primary" : "text-orange-primary"} ${onSubCard && "hidden"}`}
          >
            @
          </span>
          {company != null && (
            <a className="hover:text-grey-primary" href={company.link}>
              {company.name}
            </a>
          )}
        </div>
      </h2>
      <h4
        className={`font-normal text-2xl ${isCurrent ? "text-white" : "text-grey-primary"}`}
      >
        <span
          className={`font-bold mr-2 ${isCurrent ? "text-grey-primary" : "text-orange-primary"}`}
        >
          /
        </span>
        {date}
      </h4>
    </div>
  );
};

export default CardTitle;
