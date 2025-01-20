import { type FC } from 'react'
import { FaCode, FaDocker, FaPython, FaReact } from 'react-icons/fa'
import { SiNginx, SiTypescript } from 'react-icons/si'
import { IoLogoJavascript } from 'react-icons/io'
import { RiNextjsFill, RiPhpLine  } from "react-icons/ri";
import { TbBrandLaravel } from "react-icons/tb";
import {DiMsqlServer} from 'react-icons/di'
interface Props {
    experiencieTech: string[]
}

const TechnologiesList: FC<Props> = ({experiencieTech}) => {


    const techIcon = (name: string) =>{

        const props = {
            className: "size-8 text-orange-500",
        }

        switch(name.toLowerCase()) {
            case 'react':
              return <FaReact {...props} />;
            case 'typescript':
              return <SiTypescript {...props} title={name} />;
            case 'javascript':
              return <IoLogoJavascript {...props} />;
            case 'php':
              return <RiPhpLine {...props} />;
            case 'python':
              return <FaPython {...props} />;
              case 'next.js 14':
                return <RiNextjsFill {...props} />
            case 'laravel 10':
                return <TbBrandLaravel {...props} />
            case 'docker':
                return <FaDocker {...props} />
            case 'nginx':
                return <SiNginx {...props}/>
                case 'sql-server':
                    return <DiMsqlServer {...props}/>
            default:
              return <>
              <FaCode {...props} />
              <p>{name}</p>
              </>;
          }
    }

    const allTechs = experiencieTech.map(et => techIcon(et))


  return (
    <div className="flex flex-wrap gap-4 mb-4">
    {allTechs}
  </div>
  )
}

export default TechnologiesList