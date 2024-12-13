export function useLogtoUser() {
  const event = useEvent()

  return (event.context?.logtoUser) || null
}
