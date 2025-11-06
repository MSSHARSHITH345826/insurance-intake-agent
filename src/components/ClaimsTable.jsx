import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import './ClaimsTable.css'

function ClaimsTable({ claims }) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('submittedDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredAndSortedClaims = useMemo(() => {
    let filtered = claims.filter(claim => {
      const matchesSearch = 
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.city.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || claim.status === filterStatus
      
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      if (sortField === 'submittedDate' || sortField === 'processedDate') {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [claims, searchTerm, sortField, sortDirection, filterStatus])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status}`
    return (
      <span className={statusClass}>
        {t(`dashboard.status.${status}`)}
      </span>
    )
  }

  return (
    <div className="claims-table-widget">
      <div className="table-header">
        <h2>{t('dashboard.claimsList')}</h2>
        <div className="table-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">{t('dashboard.allStatuses')}</option>
            <option value="accepted">{t('dashboard.status.accepted')}</option>
            <option value="pending">{t('dashboard.status.pending')}</option>
            <option value="denied">{t('dashboard.status.denied')}</option>
          </select>
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="table-container">
        <table className="claims-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('claimNumber')}>
                {t('dashboard.claimNumber')}
                {sortField === 'claimNumber' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('patientName')}>
                {t('dashboard.patientName')}
                {sortField === 'patientName' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('memberId')}>
                {t('dashboard.memberId')}
                {sortField === 'memberId' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('city')}>
                {t('dashboard.city')}
                {sortField === 'city' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                {t('dashboard.status')}
                {sortField === 'status' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('amount')}>
                {t('dashboard.amount')}
                {sortField === 'amount' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('submittedDate')}>
                {t('dashboard.submittedDate')}
                {sortField === 'submittedDate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClaims.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  {t('dashboard.noResults')}
                </td>
              </tr>
            ) : (
              filteredAndSortedClaims.map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.claimNumber}</td>
                  <td>{claim.patientName}</td>
                  <td>{claim.memberId}</td>
                  <td>{claim.city}</td>
                  <td>{getStatusBadge(claim.status)}</td>
                  <td>${claim.amount.toLocaleString()} {claim.currency}</td>
                  <td>{new Date(claim.submittedDate).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <span>
          {t('dashboard.showing')
            .replace('{{count}}', filteredAndSortedClaims.length)
            .replace('{{total}}', claims.length)}
        </span>
      </div>
    </div>
  )
}

export default ClaimsTable
