type PromiseFunction = (foo?: any) => Promise<any>

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
