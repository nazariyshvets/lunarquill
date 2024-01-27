const DBConfig = {
  name: "db",
  version: 1,
  objectStoresMeta: [
    {
      store: "virtualBgImages",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "id", keypath: "id", options: { unique: true } },
        { name: "source", keypath: "source", options: { unique: false } },
      ],
    },
    {
      store: "virtualBgVideos",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "id", keypath: "id", options: { unique: true } },
        { name: "source", keypath: "source", options: { unique: false } },
      ],
    },
  ],
};

export default DBConfig;
