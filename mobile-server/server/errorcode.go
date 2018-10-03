package server

import "github.com/gin-gonic/gin"

var (
	errorInvalidSignature = gin.H{
		"code":    1000,
		"message": "invalid signature",
	}

	errorInvalidAuthorizationFormat = gin.H{
		"code":    1001,
		"message": "invalid authorization format",
	}

	errorAuthorizationExpired = gin.H{
		"code":    1002,
		"message": "authorization expired",
	}

	errorDeleteAccountRenting = gin.H{
		"code":    1003,
		"message": "cannot delete renting bitmark",
	}

	errorDeleteAccountTracking = gin.H{
		"code":    1004,
		"message": "cannot delete tracking bitmark",
	}

	errorDeleteAccountPushToken = gin.H{
		"code":    1005,
		"message": "cannot delete push notification uuid",
	}

	errorInvalidParameters = gin.H{
		"code":    1006,
		"message": "invalid parameters",
	}

	errorInvalidFileParameters = gin.H{
		"code":    1007,
		"message": "invalid file or file not found",
	}

	errorInternalServer = gin.H{
		"code":    999,
		"message": "internal server error",
	}

	errorCannotParseRequest = gin.H{
		"code":    1008,
		"message": "cannot parse request",
	}

	errorNoItems = gin.H{
		"code":    1009,
		"message": "no items",
	}
)
