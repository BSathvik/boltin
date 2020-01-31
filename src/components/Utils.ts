export const formatTimestamp = (time: number): string => {
    const dateTime = new Date(time * 1000);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateTime.toLocaleDateString(undefined, options) + " at " + 
            dateTime.toLocaleTimeString(undefined, {timeStyle: "short"} as any);
} 

export const formatFiat = (btc: number, price: number, frac: number = 4): string => {
    return `$${(btc * price).toFixed(frac)}`;
}