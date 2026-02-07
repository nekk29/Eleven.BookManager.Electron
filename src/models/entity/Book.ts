import SystemEntity from "./base/SystemEntity";

export default class Book extends SystemEntity {
    title: string = '';
    normalizedTitle: string = '';
    filePath: string = '';
    sent: boolean = false;
    pending: boolean = true;
}
