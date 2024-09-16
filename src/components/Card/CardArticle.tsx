import { type FC } from 'react'
import type { ContentExperience, Experience } from '../../types/Experience';
import CardTitle from './CardTitle';
import { t } from 'i18next'

interface Props{
    article: Experience | any;
}

const CardArticle: FC<Props> = ({article}) => {

    const articleClass = article.current ? "bg-orange-primary rounded-lg pl-7 pt-3 p-2 mb-5" : "";
    const contentClass = article.current ? "hidden" : "pl-5 pb-4 mb-5 border border-t-0 border-r-0 border-l-orange-primary border-b-orange-primary rounded-bl-lg text-grey-primary";
 
    return (
    <article className={articleClass}>
    <CardTitle
        title={article.title}
        date={t(article.date)}
        company={article.company}
        isCurrent={article.current}
    />
    <div className={contentClass}>
        {article.content?.map((c: ContentExperience) => <div className="mb-2">
            <h5 className="font-bold mb-2">{c.title}</h5>
            {c.list.map( task => <p>- {task}</p>)}
        </div>)}
    </div>
</article>
  )
}

export default CardArticle