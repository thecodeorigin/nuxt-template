export default defineTask({
  meta: {
    name: 'email:test',
    description: 'Test email sender',
  },
  async run() {
    const { sendMail } = useNodeMailer()

    await sendMail({
      subject: 'Hehe test',
      to: ['nguyenhuunguyeny.ny@gmail.com'],
      html: 'This is a test email',
    })

    return { result: 'Success' }
  },
})
