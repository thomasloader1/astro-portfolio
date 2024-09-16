import { type FC } from 'react'
import { t } from 'i18next'
import CardTitle from './CardTitle';
import CardContent from './CardContent';
import { BG_CURRENT_CARD } from '../../lib/constans/tailwindClassGroups';

interface Props{
    article: any
}

const SubCard: FC<Props> = ({article}) => {
    const articleClass = article.current ? BG_CURRENT_CARD : "";

    return (
        <article className={articleClass}>
            <CardTitle
                title={article.title}
                date={t(article.date)}
                company={null}
                isCurrent={false}
                onSubCard={true}
            />
            <CardContent article={article} onSubCard={true} />
        </article>
    )
}

export default SubCard