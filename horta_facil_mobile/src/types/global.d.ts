declare module 'react-native-sqlite-storage' {
  export interface ResultSet {
    rows: {
      length: number;
      item: (index: number) => any;
    };
    insertId?: number;
  }

  export interface Transaction {
    executeSql(sql: string, params?: any[]): Promise<[ResultSet]>;
  }

  export interface SQLiteDatabase {
    executeSql(sql: string, params?: any[]): Promise<[ResultSet]>;
    transaction(
      callback: (tx: Transaction) => Promise<void> | void,
    ): Promise<void>;
  }

  const SQLite: {
    enablePromise: (enabled: boolean) => void;
    openDatabase: (config: { name: string; location?: string }) => Promise<SQLiteDatabase>;
  };

  export default SQLite;
}

declare module '*.json' {
  const value: any;
  export default value;
}
