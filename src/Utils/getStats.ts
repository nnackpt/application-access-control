import getValue from "./getValue"

type AnyRecord = Record<string, unknown>

interface GetStatsParams {
  data: AnyRecord[]
  activeKeys?: string[]
  updatedKeys?: string[]
  createdKeys?: string[]
}

export const getStats = ({
  data,
  activeKeys = ['active'],
  updatedKeys = ['updateD_DATETIME'],
  createdKeys = ['createD_DATETIME'],
}: GetStatsParams) => {
  const total = data.length

  const active = data.filter(item => {
    const activeValue = getValue<boolean>(item, activeKeys)
    return activeValue === true
  }).length

  const inactive = total - active

  const latestUpdate = data.reduce((latest: string | null, item) => {
    const updatedDate = getValue<string>(item, updatedKeys)
    const createdDate = getValue<string>(item, createdKeys)
    const itemDate = updatedDate || createdDate
    if (!itemDate) return latest

    const itemTime = new Date(itemDate).getTime()
    const latestTime = latest ? new Date(latest).getTime() : 0
    return itemTime > latestTime ? itemDate : latest
  }, null)

  const getLastUpdated = () => {
    if (!latestUpdate) return 'No data'

    const today = new Date()
    const updateDate = new Date(latestUpdate)
    const diffTime = today.getTime() - updateDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return updateDate.toLocaleDateString('th-TH')
  }

  return {
    total,
    active,
    inactive,
    getLastUpdated,
  }
}