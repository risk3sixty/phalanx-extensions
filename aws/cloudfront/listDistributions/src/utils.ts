import XLSX, { WorkBook, WorkSheet } from 'xlsx'

type PromiseFunction = (foo?: any) => Promise<any>
interface StringMap {
  [key: string]: any
}

async function sleep(milliseconds: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function exponentialBackoff(
  promiseFunction: PromiseFunction,
  failureFunction: any = () => {},
  err: null | Error = null,
  totalAllowedBackoffTries: number = 3,
  backoffAttempt: number = 1
): Promise<any> {
  const backoffSecondsToWait = 2 + Math.pow(backoffAttempt, 2)

  if (backoffAttempt > totalAllowedBackoffTries) throw err

  try {
    const result = await promiseFunction()
    return result
  } catch (err) {
    failureFunction(err, backoffAttempt)
    await sleep(backoffSecondsToWait * 1000)
    return await exponentialBackoff(
      promiseFunction,
      failureFunction,
      err,
      totalAllowedBackoffTries,
      backoffAttempt + 1
    )
  }
}

export const WorkbookHandler = {
  workbook: XLSX.utils.book_new(),

  // https://www.npmjs.com/package/xlsx#writing-functions
  // https://www.npmjs.com/package/xlsx#writing-options
  getXlsx(): Buffer {
    return XLSX.write(this.workbook, { type: 'buffer' })
  },

  /**
   * Add a sheet to the workbook
   * @param ary array of objects of data to save to worksheet
   * @param name optional name of new worksheet
   */
  addSheet(ary: StringMap[], name: string): WorkBook {
    const ws = this.createWorksheet(ary)
    XLSX.utils.book_append_sheet(this.workbook, ws, name || 'New Worksheet')
    return this.workbook
  },

  createWorksheet(ary: StringMap[]): WorkSheet {
    const data = this.objAryToAryOfArys(ary)
    return XLSX.utils.aoa_to_sheet(data)
  },

  /**
   * objAryToAryOfArys: take an array of objects and convert them to an array
   * of nested arrays to be compatible with building worksheet data in 'xlsx'
   * https://www.npmjs.com/package/xlsx#working-with-the-workbook
   * @param ary
   */
  objAryToAryOfArys(ary: StringMap[]): any[][] {
    return ary.reduce((ary: any[][], obj: StringMap, ind: number) => {
      if (ind === 0) ary.push(Object.keys(obj))
      ary.push(Object.values(obj))
      return ary
    }, [])
  },
}
