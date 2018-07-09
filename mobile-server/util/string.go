package util

func ShortenAccountNumber(accountNumber string) string {
	length := len(accountNumber)
	if length < 8 {
		return ""
	}

	return "[" + accountNumber[:4] + "..." + accountNumber[length-4:] + "]"
}
