import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AllSubGreddiits } from './AllSubGreddiits'
import { getAllSubHubs, leaveSubHub } from '../../services/subgreddiits'

jest.mock('../../services/subgreddiits', () => ({ getAllSubHubs: jest.fn(), leaveSubHub: jest.fn() }))

beforeEach(() => {
  localStorage.setItem('loggedUser', JSON.stringify({ token: 'test' }))
  getAllSubHubs.mockResolvedValue([
    { id: '1', name: 'Design club', description: 'Typography and color', tags: ['design'], members: 3, isMember: true },
    { id: '2', name: 'Garden club', description: 'Plants and seeds', tags: ['nature'], members: 1 }
  ])
})

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

test('searches community descriptions using the directory response', async () => {
  render(<MemoryRouter><AllSubGreddiits /></MemoryRouter>)
  await screen.findByRole('heading', { name: 'Design club' })

  fireEvent.change(screen.getByRole('textbox', { name: 'Search communities' }), { target: { value: 'typography' } })

  expect(screen.getAllByRole('article')).toHaveLength(1)
  expect(screen.getByRole('heading', { name: 'Design club' })).toBeTruthy()
  expect(getAllSubHubs).toHaveBeenCalledTimes(1)
})

test('shows the updated membership after a confirmed leave', async () => {
  leaveSubHub.mockResolvedValue({ members: ['another-member'] })
  render(<MemoryRouter><AllSubGreddiits /></MemoryRouter>)

  fireEvent.click(await screen.findByRole('button', { name: 'Leave', exact: true }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Leave community' }))

  expect(await screen.findByRole('button', { name: 'Rejoining unavailable' })).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Open community' })).toBeNull()
  expect(leaveSubHub).toHaveBeenCalledWith('test', '1')
})
