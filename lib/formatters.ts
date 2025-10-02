/**
 * 전화번호를 010-0000-0000 형식으로 포맷팅합니다.
 * @param value 입력된 전화번호 문자열
 * @returns 포맷팅된 전화번호 문자열
 */
export function formatPhoneNumber(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, "");

  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else {
    // 11자리 초과시 11자리까지만 사용
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
}

/**
 * 전화번호에서 숫자만 추출합니다.
 * @param value 포맷팅된 전화번호 문자열
 * @returns 숫자만 포함된 문자열
 */
export function extractPhoneNumbers(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * 전화번호 유효성을 검사합니다.
 * @param value 전화번호 문자열
 * @returns 유효한 전화번호인지 여부
 */
export function isValidPhoneNumber(value: string): boolean {
  const numbers = extractPhoneNumbers(value);
  return numbers.length === 11 && numbers.startsWith("010");
}
