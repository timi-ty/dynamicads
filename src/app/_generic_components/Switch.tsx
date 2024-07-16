/**This code was generated entirely by ChatGPT with no edits except for this comment and the export. */

import React from "react";

interface SwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

const Switch: React.FC<SwitchProps> = ({ isOn, handleToggle }) => {
  return (
    <div
      className={`flex h-6 w-10 cursor-pointer items-center rounded-full p-1 ${
        isOn ? "bg-[#86EFAC]" : "bg-[#E4E4E7]"
      }`}
      onClick={handleToggle}
    >
      <div
        className={`h-4 w-4 transform rounded-full bg-white shadow-md duration-300 ease-in-out ${
          isOn ? "translate-x-4" : ""
        }`}
      />
    </div>
  );
};

export default Switch;
