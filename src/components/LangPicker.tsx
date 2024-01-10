import React, { useState, useRef } from 'react';

interface Language {
  name: string;
  code: string;
  route: string;
}

const LangPicker: React.FC = () => {
  const languages: Language[] = [
    { name: 'English (US)', code: 'en', route: '/en' },
    { name: 'Español', code: 'es', route: '/' },
  ];

  const [lang] = languages.filter(
    (lang) => lang.code === document.getElementsByTagName('html')[0].attributes[0].value
  );

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(lang);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLanguageChange = (newLang: Language) => {
    setSelectedLanguage(newLang);
    setDropdownVisible(false);
    window.location.href = `${newLang.route}`;
  };

  const isLangActiveRef = useRef(lang.name === selectedLanguage.name)

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
        onClick={handleToggleDropdown}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-language mr-2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 5h7" />
          <path d="M9 3v2c0 4.418 -2.239 8 -5 8" />
          <path d="M5 9c0 2.144 2.952 3.908 6.7 4" />
          <path d="M12 20l4 -9l4 9" />
          <path d="M19.1 18h-6.2" />
        </svg>
        {selectedLanguage.name}
      </button>
      {dropdownVisible && (
        <div className="absolute right-0 mt-2 py-2 bg-white  rounded-lg shadow dark:bg-gray-700">
          {languages.map((lang) => (
            <a
              key={lang.code}
              onClick={() =>  {!(lang.name === selectedLanguage.name) && handleLanguageChange(lang)}}
              className={`block px-4 py-2 text-sm text-gray-700 ${lang.name === selectedLanguage.name ? 'bg-gray-100 dark:bg-gray-600 dark:text-white cursor-not-allowed' : 'cursor-pointer'} hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white`}
            >
              {lang.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default LangPicker;
