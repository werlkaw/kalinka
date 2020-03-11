function convertDateToUTC(inDate: Date): Date {
    return new Date(inDate.getUTCFullYear(),
                    inDate.getUTCMonth(),
                    inDate.getUTCDate(),
                    inDate.getUTCHours(),
                    inDate.getUTCMinutes(),
                    inDate.getUTCSeconds());
}

/**
 * 
 * @param inDate Date in UTC
 */
function getSecondSundayInMarch(currentYear: number): Date {
    const marchFirst = new Date(currentYear,
                               3,
                               1,
                               0,   // hours
                               0,   // minutes
                               1);  // seconds
    let secondSundayDate = 8;                               
    if (marchFirst.getDay() !== 0) {
        secondSundayDate = 8 + 7 - marchFirst.getDay();
    }
    return new Date(marchFirst.getUTCFullYear(),
                    3,
                    secondSundayDate,
                    8,
                    0,
                    0);
}

/**
 * 
 * @param inDate Date in UTC
 */
function getFirstSundayInNov(currentYear: number): Date {
    const novFirst = new Date(currentYear,
                              11,
                              1,
                              0,   // hours
                              0,   // minutes
                              1);  // seconds
    let firstSundayInNov = 1;                               
    if (novFirst.getDay() !== 0) {
        firstSundayInNov = 8 - novFirst.getDay();
    }
    return new Date(novFirst.getUTCFullYear(),
                    11,
                    firstSundayInNov,
                    7,
                    0,
                    0);
}

function isDST(utcDate: Date): boolean {
    const currYear = utcDate.getUTCFullYear();
    return utcDate < getSecondSundayInMarch(currYear) &&
           utcDate > getFirstSundayInNov(currYear);
}

export function getKalinkaDate(): Date {
    const utcDate = convertDateToUTC(new Date());
    // Difference between UTC and PST
    let hoursToSubtract = isDST(utcDate) ? 7 : 8;
    utcDate.setHours(utcDate.getHours() - hoursToSubtract);
    return utcDate;
}
