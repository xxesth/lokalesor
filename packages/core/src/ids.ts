/** Sunucu tarafı ID üretimi (sözleşme: ID'ler string ve her zaman sunucuda üretilir). */
export const newId = (): string => crypto.randomUUID();
