import classNames from "classnames";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ComponentInfo, WithCode } from "../../types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { StepContext } from "../step";
import { AppThunk, RootState } from "../store";
import styles from "./componentToggle.module.css";
import defaultImage from "../../images/componentDefault.png";
import { selectSetupParameters, setErrorMessage } from "../../features";
import { PayloadAction } from "@reduxjs/toolkit";

interface ComponentListProps<T extends WithCode<ComponentInfo>> {
  selector: (state: RootState) => T[];
  toggleComponent: (code: string) => PayloadAction<{ code: string }> | AppThunk;
  getLabelKey: (component: T) => string;
  getLockedKey?: (component: T) => string | null;
  unsorted?: boolean;
}

export const ComponentToggle = <T extends WithCode<ComponentInfo>>({
  selector,
  toggleComponent,
  getLabelKey,
  getLockedKey,
  unsorted,
}: ComponentListProps<T>) => {
  const components = useAppSelector(selector);
  const { errorMessage } = useAppSelector(selectSetupParameters);
  const dispatch = useAppDispatch();
  const { stepActive } = useContext(StepContext);
  const [largeLabels, setLargeLabels] = useState(false);
  const { t, i18n } = useTranslation();

  // Sort our component list, then memoize the result for performance
  const sortedComponents = useMemo(() => {
    // Reset large labels flag in case we changed language
    setLargeLabels(false);

    // For sorting purposes, generate the final label text in advance
    const returnValue = components.map((component) => {
      // If any label in our list is longer than 30 characters then we give more room for the labels
      // In the future I'd really like to replace this with a CSS only solution
      const label = t(getLabelKey(component));
      if (label.length > 30) setLargeLabels(true);

      return {
        ...component,
        label,
      };
    });

    // Sort it by default (unless asked explicitly not to)
    if (!unsorted) returnValue.sort((a, b) => a.label.localeCompare(b.label, i18n.language));

    return returnValue;
  }, [components, t, getLabelKey, unsorted, i18n.language]);

  return (
    <div
      className={classNames(styles.carousel, {
        [styles.largeLabels]: largeLabels,
        [styles.inactive]: !stepActive,
      })}
    >
      {sortedComponents.map((component) => {
        if (component.enabled || stepActive) {
          const componentLockedKey = getLockedKey ? getLockedKey(component) : null;
          const componentLocked = componentLockedKey != null;
          return (
            <button
              key={component.code}
              className={classNames(styles.component, {
                [styles.enabled]: stepActive && component.enabled,
                [styles.locked]: stepActive && componentLocked,
              })}
              onClick={() =>
                componentLocked
                  ? dispatch(setErrorMessage(componentLockedKey))
                  : dispatch(toggleComponent(component.code))
              }
              disabled={!stepActive}
              title={stepActive && componentLocked ? t(componentLockedKey) : undefined}
              tabIndex={stepActive && componentLocked ? -1 : undefined}
              role="switch"
              aria-checked={component.enabled}
              aria-disabled={stepActive ? componentLocked : undefined}
              aria-label={stepActive ? component.label : undefined}
              aria-invalid={stepActive && errorMessage ? true : undefined}
              aria-errormessage={stepActive && errorMessage ? "appError" : undefined}
            >
              <img
                className={styles.image}
                src={
                  component.image
                    ? process.env.PUBLIC_URL + "/images/" + component.image
                    : defaultImage
                }
                alt="" // We're including the alt text in the button itself so don't bother reading out the image
                aria-hidden="true"
              />
              <div className={styles.label}>
                <span>{component.label}</span>
              </div>
            </button>
          );
        }
        return null;
      })}
    </div>
  );
};
