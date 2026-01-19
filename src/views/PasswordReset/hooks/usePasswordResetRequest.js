import { useCallback, useState } from 'react'
import { requestPasswordReset } from 'api/auth'
import { getTenantFromHostname } from 'utils/tenant'

export const usePasswordResetRequest = () => {
    const tenant = getTenantFromHostname()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const submitRequest = useCallback(async (email) => {
        setLoading(true)
        setError(null)
        try {
            await requestPasswordReset({ email, tenant })
            setSuccess(true)
            return { ok: true, error: null }
        } catch (err) {
            setError(err)
            return { ok: false, error: err }
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        success,
        submitRequest,
    }
}
