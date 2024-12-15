"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamAnalyticsStore = void 0;
const config_1 = require("../../config");
class ExamAnalyticsStore {
    constructor() {
        this.store = new Map();
    }
    getStore() {
        return this.store;
    }
    setKey(k, v) {
        config_1.log.warn(`User Status: id - ${k} - status - ${v}`);
        this.store.set(k, v);
    }
    updateKey(k, v) {
        if (this.store.has(k)) {
            config_1.log.warn(`User Status: id - ${k} - status - ${v}`);
            this.store.set(k, v);
            return;
        }
    }
    getValue(k) {
        return this.store.get(k);
    }
    delKey(k) {
        return this.store.delete(k);
    }
}
exports.ExamAnalyticsStore = ExamAnalyticsStore;
