import LibrarySettings from "./LibrarySettings";
import CalibreSettings from "./CalibreSettings";
import AmazonSettings from "./AmazonSettings";
import SmtpSettings from "./SmtpSettings";

export default interface AppSettings {
    librarySettings: LibrarySettings;
    calibreSettings: CalibreSettings;
    amazonSettings: AmazonSettings;
    smtpSettings: SmtpSettings;
}
