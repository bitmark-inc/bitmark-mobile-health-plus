package blockchain

const (
	EventTrackingBitmarkConfirmed = "tracking_transfer_confirmed"
)

var (
	messages = map[string]string{
		EventTrackingBitmarkConfirmed: "Your tracked property %s status has been updated, tap to view details.",
	}
)
