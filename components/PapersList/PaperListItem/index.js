import { Wrapper, Text, Separator } from './styles';

export default function PaperListItem({ item, index, accuracy, accuracy_list, length }) {
  return (
    <>
        {index === 0 && (
            <>
                <Wrapper accuracy_list={accuracy_list}>
                    <Text title>Rank</Text>
                    <Text title>Model</Text>
                    <Text title>Paper</Text>
                    {accuracy_list?.map(accuracy => (
                        <Text title right>{accuracy.name}</Text>
                    ))}
                    <Text title right>Hardware Burden</Text>
                    <Text title right>Publication Date</Text>
                </Wrapper>
                <Separator />
            </>
        )}
        <Wrapper accuracy_list={accuracy_list}>
            <Text>000</Text>
            <Text>{item.name}</Text>
            <Text link>{item.paper_title || '-'}</Text>
            {accuracy_list?.map(accuracy => (
                <Text right>{item[accuracy.name] || '-'}</Text>
            ))}
            <Text right>
                {item.hardware_burden ? (
                    <>
                    10
                    <sup>
                        {Math.log10(item.hardware_burden).toFixed(1)}
                    </sup>
                    </>
                ) : "-"}
            </Text>
            <Text right>{item.paper_publication_date}</Text>
        </Wrapper>
        {index < length - 1 ? <Separator /> : null}
    </>
  )
}
