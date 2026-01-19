import { useCallback, useState } from 'react'
import { confirmPasswordReset } from 'api/auth'
import { getTenantFromHostname } from 'utils/tenant'

export const usePasswordResetConfirm = () => {
    const tenant = getTenantFromHostname()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const submitNewPassword = useCallback(async ({ token, newPassword }) => {
        setLoading(true)
        setError(null)
        try {
            const response = await confirmPasswordReset({ token, newPassword, tenant })
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
        submitNewPassword,
    }
}
