// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import AmazonServiceApis from "./apis/AmazonServiceApis";
import CalibreServiceApis from "./apis/CalibreServiceApis";
import SettingsServiceApis from "./apis/SettingsServiceApis";
import UtilsServiceApis from "./apis/UtilsServiceApis";

AmazonServiceApis.register();
CalibreServiceApis.register();
SettingsServiceApis.register();
UtilsServiceApis.register();
