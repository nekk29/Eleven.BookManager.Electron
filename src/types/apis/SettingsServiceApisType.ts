import ResponseDto from "../../models/dto/base/ResponseBaseDto";
import LibrarySettings from "../../models/settings/LibrarySettings";
import CalibreSettings from "../../models/settings/CalibreSettings";
import AmazonSettings from "../../models/settings/AmazonSettings";
import SmtpSettings from "../../models/settings/SmtpSettings";

export type SettingsServiceApisType = {
     createStore(): Promise<void>;
     setLibrarySettings(librarySettings: LibrarySettings): Promise<void>;
     getLibrarySettings(): Promise<LibrarySettings>;
     setCalibreSettings(calibreSettings: CalibreSettings): Promise<void>;
     getCalibreSettings(): Promise<CalibreSettings>;
     setAmazonSettings(amazonSettings: AmazonSettings): Promise<void>;
     getAmazonSettings(): Promise<AmazonSettings>;
     validateAmazonSettings(amazonSettings?: AmazonSettings | null): Promise<ResponseDto>;
     setSmtpSettings(smtpSettings: SmtpSettings): Promise<void>;
     getSmtpSettings(): Promise<SmtpSettings>;
     validateSmtpSettings(smtpSettings?: SmtpSettings | null): Promise<ResponseDto>;
     setValue(key: string, value: unknown): void;
     getValue(key: string, defaultValue: unknown): unknown;
};
