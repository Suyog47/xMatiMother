declare module 'ms' {
  /**
   * Parse the given string and return milliseconds.
   * @param str The string to parse
   * @return The number of milliseconds
   */
  function ms(str: string): number;

  /**
   * Format the given value in milliseconds and return a string.
   * @param ms The number of milliseconds
   * @return The formatted string
   */
  function ms(ms: number): string;

  export = ms;
}