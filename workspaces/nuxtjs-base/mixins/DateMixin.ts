import Vue from 'vue'
import { DateTime, DurationUnit, Duration } from 'luxon'

export default Vue.extend({
  filters: {
    date(value: string | undefined, format = 'DATETIME_MED', defaultReturn = '-') {
      if (!value) {
        return defaultReturn
      }

      return DateTime.fromISO(value).toLocaleString(DateTime[format])
    },

    dateToRelativeCalendar(value: string | undefined, defaultReturn = '-') {
      if (!value) {
        return defaultReturn
      }

      return DateTime.fromISO(value).toRelativeCalendar()
    },

    msToHuman(value: number | undefined, unit: DurationUnit) {
      if (!value) {
        return 'Unknown'
      }

      return Duration.fromObject({ milliseconds: value }, {
        conversionAccuracy: 'longterm'
      }).shiftTo(unit).toHuman()
    }
  }
})
