<template>
  <div class="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 gap-x-8">
      <div class="space-y-8">
        <Section title="Section" subtitle="Lorem ipsum dolor sit">
          <template #header>
            Header
          </template>

          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore nemo ex magni dicta dolore. Illo, aspernatur in eum perferendis natus velit delectus vel consectetur! Cupiditate in minus est aspernatur dolores?
        </Section>

        <Box
          title="Box"
          subtitle="Display a box for content with a header, body and footer."
          tooltip="This is a tooltip">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique rerum id minus itaque dolores, assumenda illo aperiam tempora at sit sed quisquam iure autem. Assumenda corrupti corporis placeat ab molestias?
        </Box>

        <Box title="Inputs">
          <Field
            title="Input"
            description="Field description"
            hint="Field hint">
            <input class="input" />
          </Field>

          <Field
            title="Select"
            description="Field description"
            hint="Field hint">
            <select class="input">
              <option>Value</option>
            </select>
          </Field>
        </Box>

        <Notification>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad fugit temporibus officia in voluptatem numquam doloribus perspiciatis, nobis quo expedita repellendus aut maiores illo exercitationem saepe nihil cum, a mollitia.
        </Notification>

        <Notification color="danger">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad fugit temporibus officia in voluptatem numquam doloribus perspiciatis, nobis quo expedita repellendus aut maiores illo exercitationem saepe nihil cum, a mollitia.
        </Notification>

        <Notification color="primary">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad fugit temporibus officia in voluptatem numquam doloribus perspiciatis, nobis quo expedita repellendus aut maiores illo exercitationem saepe nihil cum, a mollitia.
        </Notification>
      </div>

      <div class="space-y-8">
        <Box
          title="Buttons">
          <div>
            <Button variant="solid">Submit</Button>
            <Button variant="solid" color="pink" size="xs">Pink</Button>
            <Button variant="solid" color="blue" size="sm">Blue</Button>
            <Button variant="solid" color="primary" size="md">Primary</Button>
            <Button variant="solid" color="primary" :loading="true">Loading</Button>
            <Button variant="solid" color="primary" disabled>Disabled</Button>
            <Button variant="solid" color="warning" size="lg">Warning</Button>
            <Button variant="solid" color="danger" size="xl">Danger</Button>
          </div>

          <div>
            <Button variant="outline">Submit</Button>
            <Button variant="outline" color="pink" size="xs">Pink</Button>
            <Button variant="outline" color="blue" size="sm">Blue</Button>
            <Button variant="outline" color="primary" size="md">Primary</Button>
            <Button variant="outline" color="primary" :loading="true">Loading</Button>
            <Button variant="outline" color="primary" disabled>Disabled</Button>
            <Button variant="outline" color="warning" size="lg">Warning</Button>
            <Button variant="outline" color="danger" size="xl">Danger</Button>
          </div>

          <div>
            <Button variant="ghost">Submit</Button>
            <Button variant="ghost" color="pink" size="xs">Pink</Button>
            <Button variant="ghost" color="blue" size="sm">Blue</Button>
            <Button variant="ghost" color="primary" size="md">Primary</Button>
            <Button variant="ghost" color="primary" :loading="true">Loading</Button>
            <Button variant="ghost" color="primary" disabled>Disabled</Button>
            <Button variant="ghost" color="warning" size="lg">Warning</Button>
            <Button variant="ghost" color="danger" size="xl">Danger</Button>
          </div>

          <div>
            <Button variant="soft">Submit</Button>
            <Button variant="soft" color="pink" size="xs">Pink</Button>
            <Button variant="soft" color="blue" size="sm">Blue</Button>
            <Button variant="soft" color="primary" size="md">Primary</Button>
            <Button variant="soft" color="primary" :loading="true">Loading</Button>
            <Button variant="soft" color="primary" disabled>Disabled</Button>
            <Button variant="soft" color="warning" size="lg">Warning</Button>
            <Button variant="soft" color="danger" size="xl">Danger</Button>
          </div>
        </Box>

        <Box
          title="Loading">
          <Loading />
        </Box>

        <Box
          title="Tabs">
          <Tabs
            :tabs="[{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }]"
            value="first">

          </Tabs>
        </Box>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'IndexPage'
})
</script>
