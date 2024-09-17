import React, { useEffect, useState, type FC } from "react";
import CardArticle from "./CardArticle";
import type { Experience } from "../../types/Experience";
import { useTranslation } from "react-i18next";
interface Props {
  item: Experience | any;
}

const Card: FC<Props> = ({ item }) => {
  return <CardArticle article={item} index={item.index} />;
};

export default Card;
