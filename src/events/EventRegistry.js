// Central registry for all event types
class EventRegistry {
  constructor() {
    this.handlers = new Map()
  }

  register(eventType, handler) {
    this.handlers.set(eventType, handler)
  }

  getHandler(eventType) {
    return this.handlers.get(eventType)
  }

  getAllTypes() {
    return Array.from(this.handlers.keys())
  }

  getConfig(eventType) {
    const handler = this.handlers.get(eventType)
    return handler ? handler.getTranslatedConfig() : null
  }
}

export const eventRegistry = new EventRegistry()
