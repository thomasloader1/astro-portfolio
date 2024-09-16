import { type FC } from 'react'
import type { Experience } from '../../types/Experience';
import CardTitle from './CardTitle';
import { t } from 'i18next'
import CardContent from './CardContent';

interface Props{
    article: Experience | any;
}

const CardArticle: FC<Props> = ({article}) => {
    const articleClass = article.current ? "bg-orange-primary rounded-lg pl-5 p-4 mb-14" : "";
    
    return (
        <article className={articleClass}>
            <CardTitle
                title={article.title}
                date={t(article.date)}
                company={article.company}
                isCurrent={article.current}
            />
            <CardContent article={article} />
        </article>
  )
}

export default CardArticle