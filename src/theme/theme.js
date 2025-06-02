import { extendTheme } from "@chakra-ui/react";
import { CardComponent } from "./additions/card/card";
import { buttonStyles } from "./components/button";
import { badgeStyles } from "./components/badge";
import { inputStyles } from "./components/input";
import { progressStyles } from "./components/progress";
import { sliderStyles } from "./components/slider";
import { textareaStyles } from "./components/textarea";
import { switchStyles } from "./components/switch";
import { linkStyles } from "./components/link";
import { breakpoints } from "./foundations/breakpoints";
import { globalStyles } from "./styles";

// Create a deep copy function to prevent read-only issues
const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

const themeConfig = {
  breakpoints: deepClone(breakpoints),
  ...deepClone(globalStyles),
  ...deepClone(badgeStyles),
  ...deepClone(buttonStyles),
  ...deepClone(linkStyles),
  ...deepClone(progressStyles),
  ...deepClone(sliderStyles),
  ...deepClone(inputStyles),
  ...deepClone(textareaStyles),
  ...deepClone(switchStyles),
  ...deepClone(CardComponent)
};

export default extendTheme(themeConfig);
