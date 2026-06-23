import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import isoWeek from 'dayjs/plugin/isoWeek'
import wekkOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(isoWeek)
dayjs.extend(wekkOfYear)
dayjs.locale('fr')

export default dayjs