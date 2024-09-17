import React, { type FC } from "react";
import type { ContentExperience } from "../../types/Experience";
import SubCard from "./SubCard";
import {
  BORDER_BOTTOM_ONLY_CARD,
  BORDER_LEFT_BOTTOM_CARD,
} from "../../lib/constans/tailwindClassGroups";

interface Props {
  article: any;
  onSubCard?: boolean;
  onActive?: boolean;
}

const CardContent: FC<Props> = ({ article, onSubCard, onActive }) => {
  let hasPrev =
    typeof article?.prev !== "undefined"
      ? `pb-4 ${BORDER_BOTTOM_ONLY_CARD}`
      : "";
  const contentClass = onActive
    ? `pb-4 mb-14 ${!onSubCard && BORDER_LEFT_BOTTOM_CARD}`
    : "";

  return (
    <div className={`${contentClass} mt-4`}>
      <div className="grid md:grid-cols-2">
        {article.content?.map((c: ContentExperience) => (
          <div className={`mb-2 ${hasPrev}`}>
            <h5 className="font-bold mb-2 ml-5">{c.title}</h5>
            {c.list.map((task) => (
              <p className="ml-5">- {task}</p>
            ))}
          </div>
        ))}
      </div>
      {article?.prev?.title && <SubCard article={article.prev} />}
    </div>
  );
};

export default CardContent;
