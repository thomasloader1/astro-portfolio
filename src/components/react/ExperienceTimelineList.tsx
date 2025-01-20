import { useState, useEffect, type FC } from 'react';
import type { Experience } from '../../types/Experience';
import { FaCode, FaNodeJs, FaPython, FaReact } from 'react-icons/fa'
import { IoLogoJavascript } from 'react-icons/io'
import { SiTypescript } from 'react-icons/si'
import TechnologiesList from './TechnologiesList';

interface Props{
  experiences: Experience[]
}

const ExperienceTimelineList: FC<Props> = ({ experiences }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    setIsVisible(window.scrollY < 100); // Cambia 100 por el valor que desees
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="space-y-8">
      {experiences.map((experience) => (
        <div className="relative " key={experience.title}>
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2">
              {experience.title} <span className="text-orange-500">@</span> {experience.company}
            </h3>
            <h3 className="text-xl text-gray-600 dark:text-gray-400">
              <span className="text-orange-500 font-bold">/</span> {experience.period}
            </h3>
          </div>

          <div className='pl-4 pb-2 rounded-bl-lg border-l-2 border-b-2 border-orange-500'>
          <TechnologiesList experiencieTech={experience.technologies} />

          {Array.isArray(experience.description) && experience.description.length > 0 && (
            <ul className="list-disc list-inside mb-4 space-y-2 ">
              {experience.description.map((item, index) => (
                <li className="text-gray-700 dark:text-gray-300" key={index}>
                  {item}
                </li>
              ))}
            </ul>
          )}


          {experience.projects && Array.isArray(experience.projects) && (
            <div className="mt-4 ">
              <h4 className="font-semibold mb-2">Otros proyectos:</h4>
              <div className="space-y-2 grid grid-cols-1 md:grid-cols-3">
                {experience.projects.map((project, index) => (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg" key={index}>
                    <p className="font-medium">{project.name}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(project.tech) && project.tech.map((t, index) => (
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded" key={index}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

        </div>
      ))}
    </div>
  );
};

export default ExperienceTimelineList;