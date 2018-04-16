package twosigs

const (
	EventTransferRequest  = "transfer_request"
	EventTransferRejected = "transfer_rejected"
	EventTransferFailed   = "transfer_failed"
	EventTransferAccepted = "transfer_accepted"
)

var (
	messages = map[string]string{
		EventTransferRequest:  "You’ve received a property transfer request. Tap to review the request.",
		EventTransferRejected: "Your transfer request has been rejected. Please try again later or contact the recipient for further information.",
		EventTransferFailed:   "One of your property transfers has failed. This error may be due to a request expiration or a network error. ",
		EventTransferAccepted: "Your property transfer request has been accpeted.",
	}
)
