import { type FC } from "react";
import type { Experience } from "../../types/Experience";
import CardTitle from "./CardTitle";
import CardContent from "./CardContent";
import { activeAccordion } from "../../store/accordionExperienceStore";
import { useStore } from "@nanostores/react";

interface Props {
  article: Experience | any;
  index: number;
}

const CardArticle: FC<Props> = ({ article, index }) => {
  // Obtén el índice activo desde la tienda global
  const activeIndex = useStore(activeAccordion);

  // Calcula si este artículo está activo
  const isActive = activeIndex === index;

  // Aplica la clase CSS según si está activo o es el artículo "actual"
  const articleClass = isActive ? "bg-orange-primary" : "hover:shadow-xl";

  // Función para alternar el estado del acordeón
  const toggleAccordion = () => {
    // Si el acordeón está activo, lo desactiva. Si no, activa este acordeón.
    activeAccordion.set(isActive ? null : index);
  };

  return (
    <>
      <div
        className={`${articleClass} mb-2 p-2 rounded-xl `}
        onClick={toggleAccordion}
      >
        <CardTitle
          title={article.title}
          date={article.date}
          company={article.company}
          isCurrent={isActive}
        />
        {/* Solo muestra el contenido si el acordeón está activo */}
      </div>
      {isActive && <CardContent article={article} onActive={isActive} />}
    </>
  );
};

export default CardArticle;
