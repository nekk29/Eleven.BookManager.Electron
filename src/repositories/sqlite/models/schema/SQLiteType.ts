export enum SQLiteType {
  BOOLEAN = "BOOLEAN",
  INTEGER = "INTEGER",
  REAL = "REAL",
  DATETIME = "DATETIME",
  UUID = "UUID",
  TEXT = "TEXT",
  BLOB = "BLOB",
}

export enum SQLiteSystemType {
  INTEGER = "INTEGER",
  REAL = "REAL",
  TEXT = "TEXT",
  BLOB = "BLOB",
}

export const SQLiteTypesMapping = {
  BOOLEAN: "INTEGER",
  INTEGER: "INTEGER",
  REAL: "REAL",
  DATETIME: "TEXT",
  UUID: "TEXT",
  TEXT: "TEXT",
  BLOB: "BLOB",
}
