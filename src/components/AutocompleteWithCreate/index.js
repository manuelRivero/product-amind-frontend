import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    TextField,
    CircularProgress,
    Box,
    Button,
    makeStyles,
    MenuItem,
    InputAdornment,
    MenuList,
    Chip,
} from '@material-ui/core'
import { Add, Close } from '@material-ui/icons'
import TextDanger from 'components/Typography/Danger'
import { useDebounce } from 'hooks'

const useStyles = makeStyles({
    input: {
        width: '100%',
        '& .MuiInputBase-input': {
            background: '#fff !important',
        },
    },
    errorText: {
        marginTop: '5px',
        marginBottom: '0px',
    },
    addButton: {
        marginTop: '0.5rem',
    },
    menu: {
        maxHeight: 300,
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 5px 0 rgba(0,0,0,0.26)',
        borderRadius: '4px',
    },
    menuItem: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    selectedChip: {
        marginBottom: '0.5rem',
        height: 'auto',
        padding: '8px 12px',
        '& .MuiChip-label': {
            padding: '0 8px',
            fontSize: '14px',
        },
    },
})

export default function AutocompleteWithCreate({
    label,
    value,
    onChange,
    onSearch,
    onCreate,
    searchResults = [],
    loading = false,
    error = null,
    errorMessage = null,
    placeholder = '',
    createButtonText = 'Crear nuevo',
    noOptionsText = 'No se encontraron resultados',
    helperText = '',
    disabled = false,
    getOptionLabel = (option) => option.name || option,
    getOptionValue = (option) => option.name || option,
    getOptionId = (option) => option._id || option.id || option,
}) {
    const classes = useStyles()
    // Para mostrar el label en el chip, necesitamos obtener el objeto completo del valor
    const getDisplayLabel = useCallback((val) => {
        if (!val) return ''
        if (typeof val === 'string') {
            // Si es string (probablemente un _id), buscar el objeto en searchResults
            const found = searchResults.find(opt => getOptionId(opt) === val || getOptionValue(opt) === val)
            return found ? getOptionLabel(found) : val
        }
        return getOptionLabel(val)
    }, [searchResults, getOptionLabel, getOptionId, getOptionValue])
    
    const [selectedValue, setSelectedValue] = useState(value || '')
    const [selectedLabel, setSelectedLabel] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [open, setOpen] = useState(false)
    const [showCreateButton, setShowCreateButton] = useState(false)
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const debouncedSearchValue = useDebounce(searchValue, 300)

    // Sincronizar selectedValue con el value externo y actualizar el label
    useEffect(() => {
        if (value !== selectedValue) {
            setSelectedValue(value || '')
            const label = getDisplayLabel(value)
            setSelectedLabel(label)
            // Si se establece un valor externo, limpiar la búsqueda
            if (value) {
                setSearchValue('')
            }
        }
    }, [value, selectedValue, getDisplayLabel])

    // Actualizar el label cuando cambian los searchResults (para cuando se carga un producto editado)
    useEffect(() => {
        if (selectedValue && searchResults.length > 0) {
            const label = getDisplayLabel(selectedValue)
            if (label !== selectedLabel && label !== selectedValue) {
                setSelectedLabel(label)
            }
        }
    }, [searchResults, selectedValue, selectedLabel, getDisplayLabel])

    // Effect para buscar cuando cambia el input de búsqueda debounced
    useEffect(() => {
        if (debouncedSearchValue && debouncedSearchValue.length > 0) {
            onSearch(debouncedSearchValue)
        }
    }, [debouncedSearchValue, onSearch])

    // Effect para abrir/cerrar el menú y mostrar botón de crear
    useEffect(() => {
        if (searchResults.length > 0 && !loading && searchValue.length > 0) {
            setOpen(true)
        } else {
            setOpen(false)
        }
        setShowCreateButton(searchResults.length === 0 && !loading && searchValue.trim().length > 0)
    }, [searchResults, loading, searchValue])


    const handleSearchChange = (event) => {
        const newValue = event.target.value
        setSearchValue(newValue)
    }

    const handleSearchFocus = () => {
        if (searchValue && searchValue.length > 0 && searchResults.length > 0) {
            setOpen(true)
        }
    }

    const handleSearchBlur = () => {
        // Delay para permitir click en MenuItem
        setTimeout(() => {
            setOpen(false)
        }, 200)
    }

    const handleSelectOption = (option) => {
        // Obtener el _id del objeto seleccionado
        const optionId = getOptionId(option)
        const optionLabel = getOptionLabel(option)
        setSelectedValue(optionId)
        setSelectedLabel(optionLabel)
        onChange(optionId)
        setSearchValue('')
        setOpen(false)
    }

    const handleCreate = async () => {
        if (searchValue.trim()) {
            try {
                const newItem = await onCreate(searchValue.trim())
                // onCreate debe retornar el objeto completo con _id
                if (newItem) {
                    const itemId = getOptionId(newItem)
                    const itemLabel = getOptionLabel(newItem)
                    setSelectedValue(itemId)
                    setSelectedLabel(itemLabel)
                    onChange(itemId)
                } else {
                    // Fallback: si no retorna objeto, usar el string (aunque no debería pasar)
                    setSelectedValue(searchValue.trim())
                    setSelectedLabel(searchValue.trim())
                    onChange(searchValue.trim())
                }
                setSearchValue('')
            } catch (err) {
                // El error se maneja en el componente padre
            }
            setOpen(false)
        }
    }

    const handleClearSelected = () => {
        setSelectedValue('')
        setSelectedLabel('')
        onChange('')
        // Enfocar el input después de limpiar
        if (inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }


    return (
        <Box ref={containerRef} style={{ position: 'relative' }}>
            {/* Mostrar chip con valor seleccionado o input de búsqueda */}
            {selectedValue ? (
                <Chip
                    label={selectedLabel || selectedValue}
                    onDelete={handleClearSelected}
                    deleteIcon={<Close />}
                    className={classes.selectedChip}
                    color="primary"
                    variant="outlined"
                />
            ) : (
                <>
                    <TextField
                        ref={inputRef}
                        className={classes.input}
                        label={label}
                        placeholder={placeholder}
                        variant="outlined"
                        value={searchValue || ''}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        disabled={disabled}
                        error={!!error || !!errorMessage}
                        helperText={
                            error
                                ? 'Error al buscar. Intenta nuevamente.'
                                : helperText || ''
                        }
                        fullWidth
                        InputProps={{
                            endAdornment: loading ? (
                                <InputAdornment position="end">
                                    <CircularProgress color="inherit" size={20} />
                                </InputAdornment>
                            ) : null,
                        }}
                    />
                    {/* Menú de sugerencias */}
                    {open && searchResults.length > 0 && (
                        <MenuList 
                            className={classes.menu}
                            onMouseDown={(e) => {
                                // Prevenir que el blur cierre el menú cuando se hace click
                                e.preventDefault()
                            }}
                        >
                            {searchResults.map((option, index) => {
                                const optionLabel = typeof option === 'string' ? option : getOptionLabel(option)
                                return (
                                    <MenuItem
                                        key={index}
                                        onClick={() => handleSelectOption(option)}
                                        className={classes.menuItem}
                                    >
                                        {optionLabel}
                                    </MenuItem>
                                )
                            })}
                        </MenuList>
                    )}
                    {/* Botón para crear nuevo */}
                    {showCreateButton && searchValue.trim() && (
                        <Button
                            className={classes.addButton}
                            variant="outlined"
                            color="primary"
                            startIcon={<Add />}
                            onClick={handleCreate}
                            fullWidth
                        >
                            {createButtonText}: &ldquo;{searchValue}&rdquo;
                        </Button>
                    )}
                    {/* Mensaje cuando no hay resultados */}
                    {open && searchResults.length === 0 && searchValue.trim() && !loading && (
                        <Box style={{ marginTop: '0.5rem', padding: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                            {noOptionsText}
                        </Box>
                    )}
                </>
            )}
            
            {/* Mensaje de error */}
            {errorMessage && (
                <TextDanger>
                    <p className={classes.errorText}>{errorMessage}</p>
                </TextDanger>
            )}
        </Box>
    )
}

AutocompleteWithCreate.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    searchResults: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    placeholder: PropTypes.string,
    createButtonText: PropTypes.string,
    noOptionsText: PropTypes.string,
    helperText: PropTypes.string,
    disabled: PropTypes.bool,
    getOptionLabel: PropTypes.func,
    getOptionValue: PropTypes.func,
    getOptionId: PropTypes.func,
}
