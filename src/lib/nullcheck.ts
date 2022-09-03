export class NullCheck {
    public static isDefinedOrNonNull<T>(
        subject: T | undefined | null,
    ): subject is T {
        return subject !== undefined && subject !== null;
    }

    public static isUndefinedOrNull<T>(
        subject: T | undefined | null,
    ): subject is undefined | null {
        return subject === undefined || subject === null;
    }
}
