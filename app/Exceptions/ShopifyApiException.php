<?php

namespace App\Exceptions;

use Exception;

class ShopifyApiException extends Exception
{
    /**
     * Create a new exception instance
     */
    public function __construct(
        string $message = 'Shopify API Error',
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }

    /**
     * Render the exception as JSON
     */
    public function render()
    {
        return response()->json([
            'error' => $this->message,
            'code' => $this->code,
        ], 500);
    }
}
