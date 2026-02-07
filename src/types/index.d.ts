import { AmazonServiceApisType } from './apis/AmazonServiceApisType';
import { UtilsServiceApisType } from './apis/UtilsServiceApisType.tsx';
import { CalibreServiceApisType } from './apis/CalibreServiceApisType.tsx';
import { SettingsServiceApisType } from './apis/SettingsServiceApisType.tsx';

declare global {
  interface Window {
    amazonService: AmazonServiceApisType;
    settingsService: SettingsServiceApisType;
    calibreService: CalibreServiceApisType;
    utilsService: UtilsServiceApisType
  }
}

declare module "react" {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        webkitdirectory?: string;
    }
}

export {};
