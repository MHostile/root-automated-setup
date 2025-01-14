import { createContext, memo } from "react";
import { selectFlowSlice, selectFlowState } from "../features/selectors";
import { useAppSelector } from "../hooks";
import LanguageSelect from "./languageSelect";
import StepSwitch from "./stepSwitch";

export const stepActiveContext = createContext(false);

const StepList: React.FC = () => {
  const { futureSteps, pastSteps } = useAppSelector(selectFlowState);
  const currentFlowSlice = useAppSelector(selectFlowSlice);
  return (
    <main>
      <LanguageSelect />

      {pastSteps.map((slice, index) => (
        <StepSwitch flowSlice={slice} key={index} />
      ))}

      <stepActiveContext.Provider value={true}>
        <StepSwitch flowSlice={currentFlowSlice} />
      </stepActiveContext.Provider>

      {futureSteps.map((slice, index, array) => (
        <StepSwitch flowSlice={slice} key={array.length - index} />
      ))}
    </main>
  );
};

export default memo(StepList);
