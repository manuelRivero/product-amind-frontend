import { useCallback, useState } from 'react'
import { validatePasswordResetToken } from 'api/auth'
import { getTenantFromHostname } from 'utils/tenant'

export const usePasswordResetToken = () => {
    const tenant = getTenantFromHostname()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const validateToken = useCallback(async (token) => {
        setLoading(true)
        setError(null)
        try {
            const response = await validatePasswordResetToken({ token, tenant })
            return { ok: response?.data?.ok === true, error: null }
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
        validateToken,
    }
}
